# Deploy Node js API on AWS
Deploy Node js API on AWS EC2 Instance

Great for testing simple deployments on Cloud, VPS

## Step 1: Install NodeJS and NPM using nvm
Install node version manager (nvm) by typing the following at the command line.

```bash
sudo su -
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```
Activate nvm by typing the following at the command line.

```bash
. ~/.nvm/nvm.sh
```

Use nvm to install the latest version of Node.js by typing the following at the command line.

```bash
nvm install node
```

Test that node and npm are installed and running correctly by typing the following at the terminal:

```bash
node -v
npm -v
```

## Step 2: Install Git and clone repository from GitHub
To install git, run below commands in the terminal window:

```bash
sudo apt-get update -y
sudo apt-get install git -y
```
or 
```bash
sudo yum update -y
sudo yum install git -y
```

Just to verify if system has git installed or not, please run below command in terminal:
```bash
git --version
```

This command will print the git version in the terminal.

Run below command to clone the code repository from Github:

```bash
git clone https://github.com/dmhaui/ocr-eop.git
```

Get inside the directory and Install Packages

```bash
cd ocr-eop
npm install
```

Start the application
To start the application, run the below command in the terminal:

```bash
npm start
```

# Keep the api alive
Now, we will need to run the api 24/24 even when the EC2 console is closed

When you close the console tab in web view, even though the instance is still running, the code will not function properly

## Step 1: Install PM2
PM2 will help us continue running our code even after the terminal is closed

Install PM2 by typing the following at the command line.

```bash
npm install pm2 -g && pm2 update
```

## Step 2: Run the code by PM2


### Here are some basic commands for PM2:

pm2 start app.js: Start a Node.js application.

pm2 stop app: Stop a running application.

pm2 restart app: Restart an application.

pm2 list: List all running processes.

pm2 monit: Display a monitoring interface for all running processes.

pm2 logs: View logs of running processes.

pm2 delete app: Remove a process from PM2.


### In this project, we will use PM2 to start the server.js file:

```bash
pm2 start server.js
```

### Retrieve all processes managed:

```bash
pm2 list
```

We will see our server.js file displayed in a table.

### To stop, we can use either the name or the ID from the previous table:

```bash
pm2 stop 0
```


