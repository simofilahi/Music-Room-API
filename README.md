# Music-Room-API
## Overview
This project is an API for music events managment.

## Technologies
Project is created with:
* Nodejs
* Express
* Mongodb

## API Documentation
See the [Getting Started](https://localhost/) document.

## Setup Dev environment

Follow these instructions to run this project locally on MacOS:

- Minikube is an open source tool that enables you to run Kubernetes on your laptop or other local machine, [Read More](https://kubernetes.io/docs/tutorials/hello-minikube/):
```
$ brew install minikube //install minikube
```

- The kubectl command line tool lets you control Kubernetes clusters, [Read More](https://kubernetes.io/docs/tasks/tools/):
```
$ brew install kubernetes-cli //install kubernetes-cli
```

- Skaffold is a command line tool that facilitates continuous development for Kubernetes, [Read More](https://skaffold.dev/): 
```
$ brew install skaffold //install skaffold
```

- Create the vm machine:
> NOTE: You have to install a hypervisor if is not installed in your machine. 
```
$ minikube start //create vm or start running installed machine.
```

- Inside codebase directory run:
```
$ skaffold dev //automate deployment locally
```

- Get the ip address for testing purpose:

```
$ minikube ip // get the ip @ of vm machine
```

Enjoy development 🎉🎉🎉🎉

# Dev Architecture

![alt text](https://github.com/simofilahi/Music-Room-API/blob/main/assets/dev-architecture.png)

