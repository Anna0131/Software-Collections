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
    port_start = "5000"
    port_end = "60000"
    # find free port
    for i in range(int(port_start), int(port_end)) :
        if isValidPort(i) :
            return i
    return 0

def main(internal_port, image) :
    # select free external port
    external_port = selectPort()
    # run docker container
    cmd = "sudo docker run -p %s:%s -d %s" % (external_port, internal_port, image)
    #print(cmd)
    result = Popen(cmd, shell=True)
    streamdata = result.communicate()[0]
    rc = result.returncode # get return code of execution
    #print(result)
    #print("return code :", rc)
    if rc == 0 :
        # return code = 0, meaning execute successfully
        return "true||" + str(external_port) # use || to split message
    else :
        # otherwise, meaning execute failed
        return "false||" + str(result)

if __name__ == "__main__":
    print(main(internal_port, image))