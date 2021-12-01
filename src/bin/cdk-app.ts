#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { KurtsSmarthomeStack } from '../lib/cdk-stack';

const app = new cdk.App();
new KurtsSmarthomeStack(app, 'KurtsSmarthomeStack');
