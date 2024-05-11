from subprocess import call, PIPE, run, Popen
import sys

container_name = sys.argv[1] # container name

def main(container_name) :
    # run docker container
    cmd = "sudo docker stop %s && docker remove %s" % (container_name, container_name)
    result = Popen(cmd, shell=True)
    streamdata = result.communicate()[0]
    rc = result.returncode # get return code of execution
    print(result)
    if rc == 0 :
        # return code = 0, meaning execute successfully
        return "true"
    else :
        # otherwise, meaning execute failed
        return "false"

if __name__ == "__main__":
    print(main(container_name))
