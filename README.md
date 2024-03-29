# Demo site:
https://exerge.akerstrom.dev

The site is behind Cloudflare dns proxy.

## Servers and apis:

### Loadbalancer(s):

External ip address: `130.240.200.76`
</br>
Internal ip address: `172.30.103.212`

Functionality:

1. Ansible control node. Responsible for deploying the website.
2. HAProxy for loadbalancing incoming http traffic between webservers.

Open ports:

```
22: OpenSSH
80: HTTP - Managed by HAProxy
443: HTTPS - Managed by HAProxy
```

### Database server(s):

Internal ip address: `172.30.103.214`

Functionality:

1. Mongo database
2. Simulator
3. NFS server for webserver profile picture uploads

Open ports:

```
22: OpenSSH
80: HTTP - Managed by Nginx
```

Internal ports (for reverse proxy)

```
3000: Web server
8080: Backend server & Socket.io
```

### Webservers:

Internal ip addresses:

```
172.30.103.213
172.30.103.214
```

Functionality:

1. Web server.
2. Backend server.
3. Redis session store + websocket online user cache.
4. Nginx acting as a reverse proxy for web, backend, and websocket traffic.
5. NFS client for profile picture uploads.

Open ports:

```
22: OpenSSH
8080: Simulator
27017: MongoDB
6379: Redis
2049: NFS
```

# Development setup

## Requirements
Node >= 16.10, Redis

## Example setup
```bash
sudo pacman -S node redis
corepack enable

git clone git@github.com:chrfin-4/M7011E.git
cd M7011E

yarn install
yarn dev
```

# Deployment procedure
Deployment of this project is done through [ansible](https://www.ansible.com/).

## Requirements
4 Servers running Ubuntu 20.04:

```
1 Loadbalancer server (Control node)
2 Webservers (Managed nodes)
1 Simulator / database server. (Managed node)
```

## Setup steps
### 1) Create users. (All nodes)
Create an `ubuntu` user on each server.
```bash
sudo adduser ubuntu
```

### 2) SSH key
The control node need ssh access to all managed nodes + itself.

#### 2.1) Control node
Switch to the `ubuntu` user:
```bash
sudo -iu ubuntu
```

Generate a default ssh key
```bash
ssh-keygen
```

Copy the public ssh key.
```bash
cat ~/.ssh/id_rsa.pub # Copy output of command
```

#### 2.2) All nodes
Switch to the `ubuntu` user:
```bash
sudo -iu ubuntu
```

Append the public ssh key to `authorized_keys`
```bash
sudo -iu ubuntu
echo '<clipboard>' >> ~/.ssh/authorized_keys
```

### 3) Install Ansible (Control node)
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### 4) Project (Control node)
Switch to the `ubuntu` user:
```bash
sudo -iu ubuntu
```

#### 4.1) Download deployment files
Get the deployment files, for example through git:
```bash
git clone https://github.com/chrfin-4/M7011E.git
cd M7011E/deployment
```

#### 4.2) Configure hosts
Update the `hosts` file with the proper ip addresses for each node.
```
[loadbalancers]
x.x.x.x

[webservers]
x.x.x.x
x.x.x.x

[dbservers]
x.x.x.x
```

#### 4.3) Certificate
Create a file `exerge.pem` that contains a concatenated certificate and key.

Example:
```
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----

-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

#### 4.4) Vault password
Create a file `vault_password` that contains the ansible-vault password used to decrypt `group_vars/all/vault.yaml`.

### 5) Execute ansible playbook (Control node)
Switch to the `ubuntu` user:
```bash
sudo -iu ubuntu
```

Go to deployments
```bash
cd M7011E/deployments
```

Execute playbook
```bash
ansible-playbook site.yaml
```