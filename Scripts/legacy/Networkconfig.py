#!/usr/bin/env python
"""
Network Configuration Script
Author: Simon Teague
Version: 1.0
Date: 19/10/2020

This script will input a list of accounts on AWS to work through; Create a VPC from the csv parameter, name the vpc, setup the subnets within the vpc, name those.
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
    """vpcsetuplog file generation function"""
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
        append_new_line('vpcsetuplog.txt', 'Starting account configuration for account {}'.format(row[0]))
        session = assume_role(row[0], args.assume_role)
        ec2_client = session.client('ec2')
        ec2 = session.resource('ec2')
        sub_waiter = ec2_client.get_waiter('subnet_available')

        # Create and return the VPC and vpcID
        vpc = ec2.create_vpc(CidrBlock=row[3])
        vpc.wait_until_available()
        vpc.create_tags(Tags=[{"Key": "Name", "Value": row[4]}, {"Key": "Business Unit", "Value": row[1]}, {"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Successfully Created VPC {}'.format(vpc.id))
    
        #set dns on vpc
        ec2_client.modify_vpc_attribute( VpcId = vpc.id , EnableDnsSupport = { 'Value': True } )
        ec2_client.modify_vpc_attribute( VpcId = vpc.id , EnableDnsHostnames = { 'Value': True } )
        append_new_line('vpcsetuplog.txt', 'Set DNS attributes for VPC {}'.format(vpc.id))

        # Create the subnets within the new VPC
        subnetweba = ec2.create_subnet(CidrBlock=row[5], VpcId=vpc.id, AvailabilityZone=row[6])
        sub_waiter.wait(SubnetIds=[subnetweba.id])
        subnetweba.create_tags(Tags=[{"Key": "Name", "Value": row[7]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetweba.id, vpc.id))

        subnetwebb = ec2.create_subnet(CidrBlock=row[8], VpcId=vpc.id, AvailabilityZone=row[9])
        sub_waiter.wait(SubnetIds=[subnetwebb.id])
        subnetwebb.create_tags(Tags=[{"Key": "Name", "Value": row[10]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetwebb.id, vpc.id))

        subnetappa = ec2.create_subnet(CidrBlock=row[11], VpcId=vpc.id, AvailabilityZone=row[6])
        sub_waiter.wait(SubnetIds=[subnetappa.id])
        subnetappa.create_tags(Tags=[{"Key": "Name", "Value": row[12]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetappa.id, vpc.id))

        subnetappb = ec2.create_subnet(CidrBlock=row[13], VpcId=vpc.id, AvailabilityZone=row[9])
        sub_waiter.wait(SubnetIds=[subnetappb.id])
        subnetappb.create_tags(Tags=[{"Key": "Name", "Value": row[14]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetappb.id, vpc.id))

        subnetdba = ec2.create_subnet(CidrBlock=row[15], VpcId=vpc.id, AvailabilityZone=row[6])
        sub_waiter.wait(SubnetIds=[subnetdba.id])
        subnetdba.create_tags(Tags=[{"Key": "Name", "Value": row[16]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetdba.id, vpc.id))

        subnetdbb = ec2.create_subnet(CidrBlock=row[17], VpcId=vpc.id, AvailabilityZone=row[9])
        sub_waiter.wait(SubnetIds=[subnetdbb.id])
        subnetdbb.create_tags(Tags=[{"Key": "Name", "Value": row[18]}, {"Key": "Business Unit", "Value": row[1]},{"Key": "Environment", "Value": row[2]}])
        append_new_line('vpcsetuplog.txt', 'Created subnet {} in VPC {}'.format(subnetdbb.id, vpc.id))

        # Retrieve default security group for vpc - remove inbound/outbound rules and set Name to 'Default-catch-sg-do-not-use' and add tags
        secgroups = ec2_client.describe_security_groups(Filters=[{'Name': 'group-name', 'Values': ['default']}])
        if secgroups:
            try:
                for sg in secgroups['SecurityGroups'] :
                    append_new_line('vpcsetuplog.txt', '{} is default the security group. We will now remove all rules'.format(sg['GroupId']))
                    ec2.SecurityGroup(sg['GroupId']).revoke_ingress(IpPermissions=sg['IpPermissions'])
                    ec2.SecurityGroup(sg['GroupId']).revoke_egress(IpPermissions=sg['IpPermissionsEgress'])
                    ec2.SecurityGroup(sg['GroupId']).create_tags(Tags=[{"Key": "Name", "Value": 'Default-catch-sg-do-not-use'},{"Key": "Business Unit", "Value": row[1]}, {"Key": "Environment", "Value": row[2]}])
                    append_new_line('vpcsetuplog.txt', 'Removed Security Group Rules from Default Security Group ID {}'.format(sg['GroupId']))
            except boto3.exceptions.Boto3Error as e:
                append_new_line('vpcsetuplog.txt', (e))

        # Retrieve default route table for vpc set Name to 'Main-catch-rt-do-not-use' and add tags
        routetable = vpc.route_tables.all()
        if routetable:
            try:
                for rt in routetable:
                    append_new_line('vpcsetuplog.txt', '{} is the main Route Table. We will set tags'.format(rt.id))
                    rt.create_tags(Tags=[{"Key": "Name", "Value": 'Main-catch-rt-do-not-use'},{"Key": "Business Unit", "Value": row[1]}, {"Key": "Environment", "Value": row[2]}])
                    append_new_line('vpcsetuplog.txt', 'Set Main Route Table Tags for Route Table {}'.format(rt.id))
            except boto3.exceptions.Boto3Error as e:
                append_new_line('vpcsetuplog.txt', (e))

        # Retrieve default NACL for vpc set Name to 'Default-catch-nacl-do-not-use' add tags and remove all rules
        nacl = vpc.network_acls.all()
        if nacl:
            try:
                for acl in nacl:
                    if acl.is_default:
                        append_new_line('vpcsetuplog.txt', '{} is the default NACL. We will set tags and remove rules'.format(acl.id))
                        acl.create_tags(Tags=[{"Key": "Name", "Value": 'Default-catch-acl-do-not-use'},{"Key": "Business Unit", "Value": row[1]}, {"Key": "Environment", "Value": row[2]}])
                        acl.delete_entry(Egress=True, RuleNumber=100)
                        acl.delete_entry(Egress=False, RuleNumber=100)
                        append_new_line('vpcsetuplog.txt', 'Set Tags for NACL {}'.format(acl.id))
            except boto3.exceptions.Boto3Error as e:
                append_new_line('vpcsetuplog.txt', (e))

        # Retrieve default DHCPOtions for vpc and add tags
        dhcpoptions = ec2_client.describe_dhcp_options()
        if dhcpoptions:
            try:
                for opts in dhcpoptions['DhcpOptions']:
                    append_new_line('vpcsetuplog.txt', 'DhcpOption {} found. We will set tags'.format(opts['DhcpOptionsId']))
                    ec2.DhcpOptions(opts['DhcpOptionsId']).create_tags(Tags=[{"Key": "Name", "Value": row[19]},{"Key": "Business Unit", "Value": row[1]}, {"Key": "Environment", "Value": row[2]}])
                    append_new_line('vpcsetuplog.txt', 'Set DhcpOptions Tags for {}'.format(opts['DhcpOptionsId']))
            except boto3.exceptions.Boto3Error as e:
                append_new_line('vpcsetuplog.txt', (e))
        append_new_line('vpcsetuplog.txt', 'Finished network configuration for {account}\n'.format(account=row[0]))