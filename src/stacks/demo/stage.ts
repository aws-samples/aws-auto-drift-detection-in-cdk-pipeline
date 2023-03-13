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
import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { DemoStackA } from './stack-A';
import { DemoStackB } from './stack-B';

/**
 * This constitutes the DemoStage of the CDK pipeline
 */
export class DemoStage extends Stage {
	// Stack name
	public stackNameList: string[] = [];

	constructor(scope: Construct, id: string, props?: StageProps) {
		super(scope, id, props);
		// Instantiate stacks to be part of DemoStage of the pipeline
		const demoStackA = new DemoStackA(this, 'DemoStackA', {
			env: props?.env,
		});
		this.stackNameList.push(demoStackA.stackName);

		const demoStackB = new DemoStackB(this, 'DemoStackB', {
			env: props?.env,
		});
		this.stackNameList.push(demoStackB.stackName);
	}
}
