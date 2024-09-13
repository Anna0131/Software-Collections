"""
this script is used for running the specify docker container
"""
from subprocess import call, PIPE, run, Popen
import ast, argparse, time, socket, sys, os
from uuid import uuid4

#internal_port = 80
#image = None

#ap = argparse.ArgumentParser()
#ap.add_argument("-p", "--port", required = False) # get metric type
#ap.add_argument("-i", "--image", required = True) # specify namespace
#args = vars(ap.parse_args())
image = sys.argv[1] # docker image
internal_port = sys.argv[2] # the port which is open in the origin service of internal container
ram = sys.argv[3] # ram usage
cpu = sys.argv[4] # cpu usage
disk = sys.argv[5] # disk usage
env = sys.argv[6] # env variables
volumes = sys.argv[7] # volumes
user_id = sys.argv[8] # volumes
#image = args["image"]
#if args["port"] :
    #internal_port = ast.literal_eval((args["port"]))

# check if port is not used
def isValidPort(port):
    try:
        # Create a socket object
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('127.0.0.1', port))
        # Port is in use, not valid
        return False
    except ConnectionRefusedError:
        # Port is available, valid
        return True
    finally:
        # Close the socket
        sock.close()

def selectPort() :
    # vaild port range
    port_start = "5010"
    port_end = "60000"
    # find free port
    for i in range(int(port_start), int(port_end)) :
        if isValidPort(i) :
            return i
    return 0

def readFile(file) :
    f = open(file, 'r')
    data = f.read()
    f.close()
    return data.split('\n')

def writeFile(file, data) :
    f = open(file, "w")
    for d in data :
        f.write(d)
    f.close()

def createContainerNetwork(DEVNULL) :
    network = "software_collections"
    cmd = "sudo docker network inspect %s" % (network)
    result = Popen(cmd, shell=True, stdout=DEVNULL)
    streamdata = result.communicate()[0]
    existed = result.returncode # get return code of execution
    
    if existed != 0 :
        # create a overlay network when the network not existed
        cmd = "sudo docker network create %s -d overlay" % (network)
        result = Popen(cmd, shell=True, stdout=DEVNULL)
        streamdata = result.communicate()[0]
        res = result.returncode # get return code of execution
        if res == 0 :
            return True
        else :
            return False
    else :
        # network existed
        return True

def makeComposeFile(container_name, ram, cpu, image, env, volumes, internal_port, user_id) :
    compose_path = os.path.dirname(os.path.abspath(__file__)) + "/docker-compose.yml"
    default_compose = readFile(compose_path)
    new_compose = []
    create_volumes = False
    external_port = None
    for line in default_compose :
        if "image:" in line :
            new_compose.append(line + (" %s" % (image)) + "\n")
        elif "service_name" in line :
            new_compose.append("  %s:\n" % (container_name))
        elif "cpu" in line :
            new_compose.append(line + (" '%s'" % (cpu)) + "\n")
        elif "mem" in line :
            new_compose.append(line + (" %s" % (ram)) + "\n")
        elif "ports:" in line :
            if internal_port != "null" :
                new_compose.append(line + "\n")
                external_port = selectPort()
                new_compose.append("      - %s:%s \n" % (external_port, internal_port))
        elif "environment:" in line :
            if env != "null" : 
                new_compose.append(line + "\n")
                env = env.split("\n")
                for e in env :
                    new_compose.append("      - %s\n" % (e))
        elif "volumes:" in line :
            if volumes != "null" :
                new_compose.append(line + "\n")
                volumes = volumes.split("\n")
                for v in volumes :
                    new_compose.append("      - %s:%s\n" % (container_name, v))
                create_volumes = True
        else :
            new_compose.append(line + "\n")
    if create_volumes :
        new_compose.append("volumes:\n")
        new_compose.append("  %s:\n" % (container_name))
    stack_name = "%s-%s" % (user_id, container_name)
    new_compose_path = os.path.dirname(os.path.abspath(__file__)) + ("/%s-docker-compose.yml" % (stack_name))
    writeFile(new_compose_path, new_compose)
    return {'new_compose_path' : new_compose_path, 'external_port' : external_port, 'name' : stack_name, 'container_name' : container_name}

def deployStack(stack_info) :
    cmd = "sudo docker stack deploy --detach=true -c %s %s" % (stack_info['new_compose_path'], stack_info['name'])
    result = Popen(cmd, shell=True)
    streamdata = result.communicate()[0]
    rc = result.returncode # get return code of execution
    #print(result)
    #print("return code :", rc)
    if rc == 0 :
        # return code = 0, meaning execute successfully
        return "true||" + str(stack_info['external_port']) + "||" + stack_info['container_name'] # use || to split message
    else :
        # otherwise, meaning execute failed
        return "false||" + str(result)

def main(internal_port, image, ram, cpu, disk, env, volumes, user_id) :
    # check the image existed in local at first
    try:
        from subprocess import DEVNULL # py3k
    except ImportError:
        DEVNULL = open(os.devnull, 'wb')

    # make sure container network existed
    if not createContainerNetwork(DEVNULL) :
        return "false||failed to create container network"

    cmd_image_existed = "sudo docker inspect --type=image %s" % (image)
    result = Popen(cmd_image_existed, shell=True, stdout=DEVNULL)
    streamdata = result.communicate()[0]
    rc_image_existed = result.returncode # get return code of execution
    if rc_image_existed != 0 :
        cmd_pull_image = "sudo docker image pull %s" %(image)
        result = Popen(cmd_pull_image, shell=True, stdout=DEVNULL)
        result.wait()
        rc_pull_image = result.returncode # get return code of execution
        #print("rc pi", rc_pull_image, result, cmd_pull_image)
        if rc_pull_image != 0 :
            return "false||failed to pull the image : " + image

    # make docker run command
    container_name = str(uuid4())[:8]
    stack_info = makeComposeFile(container_name, ram, cpu, image, env, volumes, internal_port, user_id)

    # deploy stack with compose file
    res = deployStack(stack_info)

    # delete compose file
    os.remove(stack_info['new_compose_path'])

    return res

    """
    external_port = "null"
    if internal_port == "null" :
        cmd = "sudo docker run --network=software_collections --name %s --memory=%s --cpus=%s" % (container_name, ram, cpu)
    else :
        # select free external port
        external_port = selectPort()
        cmd = "sudo docker run --network=software_collections --name %s -p %s:%s --memory=%s --cpus=%s" % (container_name, external_port, internal_port, ram, cpu)

    # add env variables if not empty
    if env.strip() and env != "null" :
        env = env.split("\n")
        for e in env :
            cmd += " -e " + e
    # add volumes if not empty
    if volumes.strip() and volumes != "null" :
        volumes = volumes.split("\n")
        for v in volumes :
            cmd += " -v " + container_name + ":" + v
    # add image
    cmd += " -d " + image
    #print(cmd)

    # run docker container
    result = Popen(cmd, shell=True)
    streamdata = result.communicate()[0]
    rc = result.returncode # get return code of execution
    #print(result)
    #print("return code :", rc)
    if rc == 0 :
        # return code = 0, meaning execute successfully
        return "true||" + str(external_port) + "||" + container_name # use || to split message
    else :
        # otherwise, meaning execute failed
        return "false||" + str(result)
    """

if __name__ == "__main__":
    print(main(internal_port, image, ram, cpu, disk, env, volumes, user_id))
