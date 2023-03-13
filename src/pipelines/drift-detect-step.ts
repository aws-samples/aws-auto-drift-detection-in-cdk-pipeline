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
import { aws_codepipeline_actions as cpactions } from 'aws-cdk-lib';
import { aws_codepipeline as codepipeline } from 'aws-cdk-lib';
import { pipelines as pipelines } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import {
	CodePipelineActionFactoryResult,
	ProduceActionOptions,
	Step,
} from 'aws-cdk-lib/pipelines';
import { SSM_PARAM_DRIFT_DETECT_LAMBDA_ARN } from '../utils/cdk-utils';

/**
 * Drift detection step definition.
 */
export class DriftDetectionStep
	extends Step
	implements pipelines.ICodePipelineActionFactory
{
	constructor(
		// private readonly input: FileSet,
		private readonly stackName: string,
		private readonly account: string,
		private readonly region: string
	) {
		super(`DriftDetectionStep-${stackName}`);
	}

	public produceAction(
		stage: codepipeline.IStage,
		options: ProduceActionOptions
	): CodePipelineActionFactoryResult {
		// Define the configuraton for the action that is added to the pipeline.
		stage.addAction(
			new cpactions.LambdaInvokeAction({
				actionName: options.actionName,
				runOrder: options.runOrder,
				lambda: lambda.Function.fromFunctionArn(
					options.scope,
					`InitiateDriftDetectLambda-${this.stackName}`,
					ssm.StringParameter.valueForStringParameter(
						options.scope,
						SSM_PARAM_DRIFT_DETECT_LAMBDA_ARN
					)
				),
				// These are the parameters passed to the drift detection step implementaton provider lambda
				userParameters: {
					stackName: this.stackName,
					account: this.account,
					region: this.region,
				},
			})
		);
		return {
			runOrdersConsumed: 1,
		};
	}
}
