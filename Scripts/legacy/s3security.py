#!/usr/bin/env python
"""
S3 Security Configuration Script
Author: Simon Teague
Version: 1.0
Date: 15/10/2020

This script will input a list of accounts on AWS to work through; retrieve a list of all S3 buckets in each account, then apply the given security
configuration; such as encryption, public access and ACL if added.
"""

import boto3
import sys
import time
import argparse
import re
import json
import random
import string

from collections import OrderedDict
from botocore.exceptions import ClientError
from six.moves import input as raw_input

def assume_role(aws_account_number, role_name):
    """
    Assumes the provided role in each account within the input file
    :param aws_account_number: AWS Account Number
    :param role_name: Role to assume in target account
    :param aws_region: AWS Region for the Client call, not required for IAM calls
    :return: SecurityHub client in the specified AWS Account and Region
    """

    # Beginning the assume role process for account
    sts_client = boto3.client('sts')
    
    # Get the current partition
    partition = sts_client.get_caller_identity()['Arn'].split(":")[1]
    
    response = sts_client.assume_role(
        RoleArn='arn:{}:iam::{}:role/{}'.format(partition,aws_account_number,role_name),
        RoleSessionName='OrganizationAccountAccessRole'
    )
    
    # Storing STS credentials
    session = boto3.Session(
        aws_access_key_id=response['Credentials']['AccessKeyId'],
        aws_secret_access_key=response['Credentials']['SecretAccessKey'],
        aws_session_token=response['Credentials']['SessionToken']
    )

    print("Assumed session for {}.".format(aws_account_number))

    return session

if __name__ == '__main__':
    
    # Setup command line arguments
    parser = argparse.ArgumentParser(description='AWS Accounts to process')
    parser.add_argument('input_file', type=argparse.FileType('r'), help='Path to CSV file containing the list of account IDs and Email addresses')
    parser.add_argument('--assume_role', type=str, required=True, help="Role Name to assume in each account")
    args = parser.parse_args()

    # Generate dict with account & email information
    aws_account_dict = OrderedDict()
    
for acct in args.input_file.readlines():
    split_line = acct.rstrip().split(",")
    if len(split_line) < 2:
        print("Unable to process line: {}".format(acct))
        continue
            
    if not re.match(r'[0-9]{12}', str(split_line[0])):
        print("Invalid account number {}, skipping".format(split_line[0]))
        continue
            
    aws_account_dict[split_line[0]] = split_line[1]

# Process through accounts
for account in aws_account_dict.keys():
    session = assume_role(account, args.assume_role)
    ec2 = session.client('ec2')
    client = boto3.client('ec2')
    


    print('Finished creating core VPC for {account}'.format(account=account))