const express = require('express');
const Tesseract = require('tesseract.js');
const os = require('os');

const PORT = 80;
const app = express();
const authToken = "YOUR_AUTH_TOKEN_HERE";
let scheduler = null;
let lastActivityTime = new Date();
let numWorkers = 0
// Mảng để lưu trữ các worker
let workers = [];
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/dmhauiChat.html');
});
// Định nghĩa endpoint GET API để lấy thông tin về bộ nhớ RAM và số lượng worker
app.get("/api/info", (req, res) => {
  try {
    const receivedTime = new Date();
    const completionTime = new Date();
    const ping = completionTime - receivedTime; // Execution time in milliseconds.
    const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";

    res.json({
      success: true,
      usage: usedMemory,
      ping: ping,
      currentWorkers: numWorkers
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.use(express.json());

const ensureSchedulerAndWorkers = async () => {
  if (!scheduler) {
    scheduler = Tesseract.createScheduler();
    const maxWorkers = Math.min(4, os.cpus().length);
    for (let i = 0; i < maxWorkers; i++) {
      let worker = await Tesseract.createWorker();
      scheduler.addWorker(worker);
      workers.push(worker);
      numWorkers = scheduler.getNumWorkers();
    }
  }
  lastActivityTime = new Date(); // Update last activity time.
};

const checkAndCleanResources = () => {
  const now = new Date();
  const timeSinceLastActivity = (now - lastActivityTime) / 1000; // in seconds

  if (timeSinceLastActivity > 90 && scheduler) {
    terminateWorkers();
    console.log("All workers have been terminated due to inactivity.");
  }

  if (timeSinceLastActivity > 120 && scheduler) {
    scheduler.terminate();
    scheduler = null;
    console.log("Scheduler has been terminated due to inactivity.");
  }
};
// Hàm để terminate tất cả các worker và xoá khỏi mảng
const terminateWorkers = async () => {
  await Promise.all(workers.map(async (worker, index) => {
    await worker.terminate();
    delete workers[index];
  }));
  // Lọc ra các phần tử null đã bị xoá
  workers = workers.filter(worker => worker !== null);
};
setInterval(checkAndCleanResources, 30000); // Check for inactivity every 30 seconds

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === authToken) {
    next();
  } else {
    res.sendStatus(403);
  }
};

app.use(authenticateToken);

const recognizeImages = async (imagesBase64) => {
  await ensureSchedulerAndWorkers();
  const results = await Promise.all(imagesBase64.map(async (base64) => {
    const base64Data = base64.replace(/^.*base64,/, "");
    return scheduler.addJob('recognize', Buffer.from(base64Data, 'base64'));
  }));
  return results.map(result => result.data.text);
};

app.post("/api/ocr", async (req, res) => {
  const receivedTime = new Date();
  const imagesBase64 = req.body.imagesBase64;

  try {
    const results = await recognizeImages(imagesBase64);
    const completionTime = new Date();
    const ping = completionTime - receivedTime; // Execution time in milliseconds.
    const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB";
    res.json({ success: true, results, receivedAt: receivedTime, completedAt: completionTime, ping, usage: usedMemory, currentWorkers: numWorkers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express API
module.exports = app
