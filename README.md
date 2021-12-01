
# First Time Setup

1. You will need Git, NodeJS and the AWS CLI installed first
   1. Mac should already have Git installed, you can confirm this by running `command -v git` which should output `/usr/bin/git`
   2. The best way to install NodeJs is using nvm: https://github.com/nvm-sh/nvm
      1. Install nvm using instructions at that link
      2. Then install NodeJS: `nvm install node`
   3. I would follow the Mac/command line instructions here: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
      1. The commands should be like:
         1. `curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"`
         2. `sudo installer -pkg AWSCLIV2.pkg -target /`
2. You will also need to configure the AWS CLI correctly
   1. The best way to use AWS CLI is to create a new "IAM User" using the AWS GUI here: https://console.aws.amazon.com/iamv2/home?#/users
      1. Give it a name like "command-line-user" or something like that
      2. Select `Access key - Programmatic access` checkbox
      3. Select `Attach existing policies directly` and then `AdministratorAccess`
      4. Click through next screens and create user
      5. You will only be shown the secret key ONE TIME EVER, so save it somewhere private. Also save the access key if they show it to you at that point, otherwise go find it in the UI on the `Security Credentials` tab and write it down too.
   2. Back to the command line, run `aws configure`
      1. Enter your access key
      2. Enter your secret key
      3. Region should be closest physically to you, so `us-west-2`
      4. Output format can be left blank
3. Make a new directory somewhere to hold the code for this repository, `cd` to that directory
4. Pull down the code from GitHub
   1. This should work: `git clone https://github.com/nortakales/kurts-smarthome-storage.git`
5. Run `npm install` - locally installs needed dependencies (listed in `package.json` file)
6. Run `npm run build` - transpiles the Typescript code into Javascript which is runnable by NodeJS
7. Run `npm install -g aws-cdk` - installs the aws-cdk package needed for running `cdk` commands
8. Run `cdk bootstrap` - this is one time bootstrapping for your entire AWS account to work with CDK
9. Run `cdk diff` - this should show you a diff of what will be deployed to your AWS account
10. Run `cdk deploy` - this will actually create everything in your AWS account that is defined in the code in this package, this is where the magic happens and you don't have to click around in a UI for a million years
    1.  This command will provide output to tell you the base URL for your API, which will look something like `https://x4omjnw2v2.execute-api.us-west-2.amazonaws.com/prod/`
    2.  It will *not* tell you the API key, for that you will need to go into the AWS GUI > API Gateway > API Keys

# Making Changes

1. Most changes would just be done to `src/lib/cdk-stack.ts`.
2. Run `npm run build`
3. Run `cdk diff`
4. Make sure diff output looks as you would expect (for example if you add a new API, make sure it shows up)
5. Run `cdk deploy` to deploy it to AWS

If you ever deploy the wrong thing, you should always be able to check out the previous revision of the code using git, and `cdk deploy` that to get back to a working state.

# Explanation of Files

* `.vscode/*` - these are files for the VSCode editor
* `src/*` - code is here, separation between `bin` and `src` honestly doesn't matter
* `.gitignore` - this tells git which files to ignore (in other words, they are not going to be comittedd to source control)
* `cdk.json` - CDK configuration
* `package-lock.json` - metadata about which packages you depend on are currently downloaded to your workspace
* `package.json` - defines your dependencies, and some common tasks you can run
* `tsconfig.json` - configuration for the Typescript transpiler

# Testing Your API via Command Line

Example GET (make sure to update API URL, content type, API key, etc. as needed)

```
curl --request GET --url https://x4omjnw2v2.execute-api.us-west-2.amazonaws.com/prod/kurts-smarthome-storage-bucket/most-recent-room --header 'content-type: text/json' --header 'x-api-key: API_KEY_GOES_HERE'
```

Example PUT:

```
curl --request PUT --url https://x4omjnw2v2.execute-api.us-west-2.amazonaws.com/prod/kurts-smarthome-storage-bucket/most-recent-room --header 'content-type: text/json' --header 'x-api-key: API_KEY_GOES_HERE' --data '{"Room":"Office"}'
```
