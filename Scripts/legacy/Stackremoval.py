#!/usr/bin/env python
"""
CloudformationStack removal - with termination protection check
Author: Simon Teague
Version: 1.0
Date: 23/10/2020

This script will input a list of accounts on AWS to work through; and look for the stack you name, check termination protection; and then delete.
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
        append_new_line('stacks.txt', 'Starting account Configuration for account {}'.format(row[0]))
        session = assume_role(row[0], args.assume_role)
        stack_resource = session.resource('cloudformation')
        stack_client = session.client('cloudformation')
        for stack in stack_client.list_stacks()['StackSummaries']:
            if stack['StackName'].startswith('awsconfigconforms'):
                print('{0}:{1}'.format(stack['StackName'], stack['StackId'], ))

                
    append_new_line('stacks.txt', 'Finished Account Stack removal for {account}\n'.format(account=row[0]))