"""
this script is used for running the specify docker container
"""
from subprocess import call, PIPE, run, Popen
import ast, argparse, time, socket, sys
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

def main(internal_port, image, ram, cpu, disk, env, volumes) :
    # check the image existed in local
    try:
        from subprocess import DEVNULL # py3k
    except ImportError:
        import os
        DEVNULL = open(os.devnull, 'wb')
    cmd_image_existed = "sudo docker inspect --type=image %s" % (image)
    result = Popen(cmd_image_existed, shell=True, stdout=DEVNULL)
    streamdata = result.communicate()[0]
    rc_image_existed = result.returncode # get return code of execution
    if rc_image_existed != 0 :
        cmd_pull_image = "sudo docker image pull %s" %(image)
        result = Popen(cmd_pull_image, shell=True, stdout=DEVNULL)
        rc_pull_image = result.returncode # get return code of execution
        if rc_pull_image != 0 :
            return "false||failed to pull the image : " + image
        ##print("rc pi", rc_pull_image)

    # select free external port
    external_port = selectPort()
    # make docker run command
    container_name = str(uuid4())
    cmd = "sudo docker run --name %s -p %s:%s --memory=%s --cpus=%s" % (container_name, external_port, internal_port, ram, cpu)
    # add env variables if not empty
    if env.strip() :
        env = env.split("\n")
        for e in env :
            cmd += " -e " + e
    # add volumes if not empty
    if volumes.strip() :
        volumes = volumes.split("\n")
        for v in volumes :
            cmd += " -v :" + v
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

if __name__ == "__main__":
    print(main(internal_port, image, ram, cpu, disk, env, volumes))
