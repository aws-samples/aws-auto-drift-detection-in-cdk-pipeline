/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';
import { StackProps, aws_codecommit as codecommit } from 'aws-cdk-lib';
import {
	CodePipeline,
	CodePipelineSource,
	ShellStep,
	Step,
} from 'aws-cdk-lib/pipelines';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { DriftDetectionStep } from 'src/pipelines/drift-detect-step';
import { DemoStage } from 'src/stacks/demo/stage';
import { BaseStack } from 'src/utils/base-stack';

/**
 * Stack to deploy common components and lambda layers required for the project
 */
export class PipelineStack extends BaseStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		/************************************ CodeCommit Repo ***********************************/
		const repo = new codecommit.Repository(this, 'DemoRepo', {
			repositoryName: `${this.node.tryGetContext('appName')}-repo`,
		});
		/****************************************************************************************/

		/************************************ CICD Pipeline *************************************/
		const pipeline = new CodePipeline(this, 'DemoPipeline', {
			synth: new ShellStep('synth', {
				input: CodePipelineSource.codeCommit(repo, 'main'),
				commands: ['./script-synth.sh'],
			}),
			crossAccountKeys: true,
			enableKeyRotation: true,
		});
		const demoStage = new DemoStage(this, 'DemoStage', {
			env: {
				account: this.account,
				region: this.region,
			},
		});
		const driftDetectionSteps: Step[] = [];
		for (const stackName of demoStage.stackNameList) {
			const step = new DriftDetectionStep(stackName, this.account, this.region);
			driftDetectionSteps.push(step);
		}
		pipeline.addStage(demoStage, {
			pre: driftDetectionSteps,
		});
		/****************************************************************************************/
		/************************************ NAG Supressions ***********************************/
		// Force the pipeline construct creation forward before applying suppressions.
		// @See https://github.com/aws/aws-cdk/issues/18440
		pipeline.buildPipeline();

		// Suppress findings for things automatically added and controlled  by cdk pipelines.
		NagSuppressions.addResourceSuppressions(
			pipeline,
			[
				{
					id: 'AwsSolutions-S1',
					reason: 'S3 Bucket created by CDK pipeline is not accessible to user',
				},
				{
					id: 'AwsSolutions-IAM5',
					reason:
						'CDK Pipeline artifacts S3 bucket permissions are managed by pipeline internally.\
						Also, they are needed for proper functioning of CDK pipeline',
					appliesTo: [
						'Action::s3:GetObject*',
						'Action::s3:GetBucket*',
						'Action::s3:List*',
						'Action::s3:DeleteObject*',
						'Action::s3:Abort*',
						'Action::kms:ReEncrypt*',
						'Action::kms:GenerateDataKey*',
						'Resource::*',
						'Resource::arn:*:iam::<AWS::AccountId>:role/*',
					],
				},
				{
					id: 'AwsSolutions-IAM5',
					reason:
						'All resources in the permissions are controlled by CDK pipeline per its needs and best practices.\
						Pipeline needs appropriate access to all S3 artifact bucket objects.\
						Secondly there is no way to know ahead of time the object names created at runtime',
					appliesTo: [
						{
							regex: '/^Resource::<DemoPipelineArtifactsBucket(.*)\\*$/g',
						},
					],
				},
				{
					id: 'AwsSolutions-IAM5',
					reason:
						'All resources in the permissions are controlled by CDK pipeline per its needs and best practices.\
						Pipeline needs appropriate access to write logs to all CW log groups and push build reports of specific codebuild projects that are part of the pipeline.\
						Secondly there is no way to know ahead of time the log stream and report names created at runtime.',
					appliesTo: [
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:logs:<AWS::Region>:<AWS::AccountId>:log-group:/aws/codebuild/<DemoPipelineBuildsynthCdkBuildProject(.*)\\*$/g',
						},
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:codebuild:<AWS::Region>:<AWS::AccountId>:report-group/<DemoPipelineBuildsynthCdkBuildProject(.*)\\*$/g',
						},
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:logs:<AWS::Region>:<AWS::AccountId>:log-group:/aws/codebuild/<DemoPipelineUpdatePipelineSelfMutation(.*)\\*$/g',
						},
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:codebuild:<AWS::Region>:<AWS::AccountId>:report-group/<DemoPipelineUpdatePipelineSelfMutation(.*)\\*$/g',
						},
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:logs:<AWS::Region>:<AWS::AccountId>:log-group:/aws/codebuild/(.*)\\*$/g',
						},
						{
							regex:
								'/^Resource::arn:<AWS::Partition>:codebuild:<AWS::Region>:<AWS::AccountId>:report-group/(.*)\\*$/g',
						},
					],
				},
				{
					id: 'AwsSolutions-IAM5',
					reason:
						'All resources in the permissions are controlled by CDK pipeline per its needs and best practices.\
						Pipeline action needs appropriate access to SSM Param containing ARN of the lambda that implements the action',
					appliesTo: [
						{
							regex:
								'/^Resource::<SsmParameterValueDEMODRIFTDETECTIONLAMBDAINITIATEDRIFTDETECTARN(.*)\\*$/g',
						},
					],
				},
			],
			true
		);
		/****************************************************************************************/
	}
}
