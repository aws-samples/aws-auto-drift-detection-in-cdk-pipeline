# Auto Drift Detection CDK Pipelines

## Project deploys a CDK Pipeline which has integrated Drift Detection in the form of a pre-deployment step.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

### System requirements

- [node (version >= 18x)](https://nodejs.org/en/download/)
- [awscli (v2)](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
- [cdk (v2)](https://docs.aws.amazon.com/cdk/v2/guide/cli.html)
- [jq (v1.6)](https://github.com/stedolan/jq/wiki/Installation)

## Prerequisites

Before proceeding any further, you need to identify and designate an AWS account to deploy the solution. You also need to create an AWS account profile in `~/.aws/credentials` for the designated AWS account, if you don’t already have one. The profile needs to have sufficient permissions to run an [AWS Cloud Development Kit](https://aws.amazon.com/cdk/) (AWS CDK) stack. It should be your private profile and only be used during the course of this blog. So, it should be fine if you want to use admin privileges. Don’t share the profile details, especially if it has admin privileges. I recommend removing the profile when you’re finished with the testing. For more information about creating an AWS account profile, see [Configuring the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

This project has a dependency on its pre-requiste project [here](https://gitlab.aws.dev/goldmine/auto-drift-detection-cdk-pipelines-prereq/-/tree/main). Please follow the deployment instructions for the pre-requisite project as specified in the [README.md](https://gitlab.aws.dev/goldmine/auto-drift-detection-cdk-pipelines-prereq/-/blob/main/README.md#deployment-using-cdk) before proceeding.

## Solution Architecture

![Auto Drift Detection in CDK Pipelines](./design.png?raw=true 'Architecture Diagram')

## Project Structure

Project is a part of the solution to integrate automated drift detection in CDK pipelines. It deploys a CDK Pipeline defind in `src/pipelines/stack.ts`. Pipeline has an integrated pre-deployment step to carry out Drift Detection for the stacks to be deloyed by the pipeline.

There are a couple of sample stacks defined in `src/stacks/demo/stack-A.ts` and `src/stacks/demo/stack-B.ts` for demo purposes. They are part of the pipeline stage defined in `src/stacks/demo/stage.ts`.

Drift detection step is defined in `src/pipelines/drift-detect-step.ts`; where in it uses a lambda function (already deployed via pre-requisite stack) as an implementation provider. If stack is in the drifted status, then a failure is sent back to the pipeline; else a success is sent so that the pipeline can continue.

## Deployment using CDK

> 1. Clone the repo
> 2. Navigate to the cloned folder
> 3. run `script-deploy.sh` as shown below by passing the name of the AWS profile you created in the prerequisites section above. If no profile name is passed then **default** profile will be used.
>    `./script-deploy.sh <AWS-ACCOUNT-PROFILE-NAME>`
>    CDK pipeline with a CodeCommit repo as the source should now be deployed.
> 4. Next, check in the code into CodeCommit repo. Make sure that the default profile points to the account & region where the CodeCommit repo exists and has the permission to push to the repo.
>
> ```
> git remote add blog-demo "codecommit::us-east-1://cdk-drift-detect-demo-repo"
> git push blog-demo main
> ```
