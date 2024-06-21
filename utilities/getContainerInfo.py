from subprocess import call, PIPE, run, Popen
import sys, time

container_name = sys.argv[1] # container name
info_type = sys.argv[2] # type of container info

def main(container_name, info_type) :
    if info_type == "logs" :
        return {"suc" : "true", "result" : getContainerLogs(container_name)}
    elif info_type == "resource_usage" :
        return {"suc" : "true", "result" : getContainerResourceUsage(container_name)}
    else :
        return {"suc" : "false", "error" : "undefined info type : " + info_type}

# get the resource usage of the container with docker stats
def getContainerResourceUsage(container_name) :
    cmd = "sudo docker stats | grep %s" % (container_name)
    with Popen(["docker" ,"stats"], stdout=PIPE, stderr=None) as process:
        time.sleep(3.0)
        process.kill()
        output = process.communicate()[0].decode("utf-8")
        all_container_stats = output.split("\n")
        this_container_stat = "null"
        for each_stat in all_container_stats :
            if container_name in each_stat :
                this_container_stat = each_stat
                break
        rc = process.returncode # get return code of execution
        if rc == -9 :
            # return code = 0, meaning execute successfully
            return this_container_stat
        else :
            # otherwise, meaning execute failed
            return "false"

# get the logs of the container with docker logs
def getContainerLogs(container_name) :
    cmd = "sudo docker logs %s" % (container_name)
    with Popen(cmd, stdout=PIPE, stderr=None, shell=True) as process:
        output = process.communicate()[0].decode("utf-8")
        rc = process.returncode # get return code of execution
        if rc == 0 :
            # return code = 0, meaning execute successfully
            return output
        else :
            # otherwise, meaning execute failed
            return "false"

if __name__ == "__main__":
    print(main(container_name, info_type))
