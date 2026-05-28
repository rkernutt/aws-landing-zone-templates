#!/usr/bin/env python
"""
Network Configuration Script
Author: Simon Teague
Version: 1.0
Date: 21/10/2020

This script will input a list of accounts on AWS to work through; and set all Accounts to block all S3 public access.
"""

import boto3
import sys
import time
import argparse
import re
import json
import random
import string
import collections
import csv

from collections import OrderedDict
from botocore.exceptions import ClientError

def append_new_line(file_name, text_to_append):
    """Log file generation function"""
    # Open the file in append & read mode ('a+')
    with open(file_name, "a+") as file_object:
        # Move read cursor to the start of file.
        file_object.seek(0)
        # If file is not empty then append '\n'
        data = file_object.read(100)
        if len(data) > 0:
            file_object.write("\n")
        # Append text at the end of file
        file_object.write(text_to_append)

def assume_role(aws_account_number, role_name):
    """
    Assumes the provided role in each account within the input file
    :param role_name: Role to assume in target account
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
    parser.add_argument('input_file', help='Path to CSV file containing the list of account IDs and network options')
    parser.add_argument('--assume_role', type=str, required=True, help="Role Name to assume in each account")
    args = parser.parse_args()

# Process through accounts
with open(args.input_file,'r') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    for row in reader:
        append_new_line('s3bucketpolicylog.txt', 'Starting account  for account {}'.format(row[0]))
        session = assume_role(row[0], args.assume_role)
        s3_client = session.client('s3')
        s3_resource = session.resource('s3')
        for bucket in s3_client.list_buckets()['Buckets']:
            try:
                bucket_policy = s3_client.get_bucket_policy(Bucket=bucket['Name'])['Policy']
                with open('%r-%s-original_policy.json' % ((row[0]), (bucket['Name'])), 'w') as outfile:
                    outfile.write(json.dumps(json.loads(bucket_policy), indent=4))
                with open('%r-%s-original_policy.json' % ((row[0]), (bucket['Name'])), 'r') as original_policy:
                    orig_policy = json.load(original_policy)
                #-------------- policy to add to statement ----------------------------
                add_policy = {
                        "Sid": "AllowSSLRequestsOnly",
                        "Action": "s3:*",
                        "Effect": "Deny",
                        "Resource": [
                            "arn:aws:s3:::%s" % (bucket['Name']),
                            "arn:aws:s3:::%s/*" % (bucket['Name'])
                                    ],
                        "Condition": {
                            "Bool": {
                                "aws:SecureTransport": "false"
                                    }
                            },
                        "Principal": "*"
                    }
                #------------ end of policy to add to statement ------------------------
                policy_block =  orig_policy['Statement']
                policy_block.append(add_policy)
                with open('%r-%s-new_policy.json' % ((row[0]), (bucket['Name'])), 'w') as outfile:
                    outfile.write(json.dumps(policy_block, indent=4))
                new_policy = json.dumps(policy_block)
                #bucket_policy.put(Policy=new_policy)
            except ClientError as e:
                if e.response['Error']['Code'] == 'NoSuchBucketPolicy':
                    print('Bucket: %s, has no bucket policy; adding full policy' % (bucket['Name']))
                    #-------------- policy to create ----------------------------
                    full_policy = {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Sid": "AllowSSLRequestsOnly",
                                "Action": "s3:*",
                            "Effect": "Deny",
                            "Resource": [
                                "arn:aws:s3:::%s" % (bucket['Name']),
                                "arn:aws:s3:::%s/*" % (bucket['Name'])
                                        ],
                            "Condition": {
                            "Bool": {
                                "aws:SecureTransport": "false"
                                    }
                            },
                        "Principal": "*"
                        }
                    ]
                }
                    #------------ end of policy to create ------------------------
                    with open('%r-%s-new_policy.json' % ((row[0]), (bucket['Name'])), 'w') as outfile:
                        outfile.write(json.dumps(full_policy, indent=4))
                    new_policy = json.dumps(full_policy)