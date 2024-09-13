from subprocess import call, PIPE, run, Popen
import sys

container_name = sys.argv[1] # container name
user_id = sys.argv[2] # user id

def main(container_name, user_id) :
    # run docker container
    cmd = "sudo docker stack rm %s-%s" % (user_id, container_name)
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
    print(main(container_name, user_id))
