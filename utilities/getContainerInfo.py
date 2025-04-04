from subprocess import call, PIPE, run, Popen
import sys, time

container_name = sys.argv[1] # container name
info_type = sys.argv[2] # type of container info
user_id = sys.argv[3] # user_id

def main(container_name, info_type, user_id) :
    if info_type == "logs" :
        return {"suc" : "true", "result" : getContainerLogs(container_name, user_id)}
    elif info_type == "resource_usage" :
        return {"suc" : "true", "result" : getContainerResourceUsage(container_name)}
    elif info_type == "image" :
        return {"suc" : "true", "result" : getContainerImage(container_name, user_id)}
    else :
        return {"suc" : "false", "error" : "undefined info type : " + info_type}

# get the resource usage of the container with docker stats
def getContainerResourceUsage(container_name) :
    cmd = "sudo docker stats | grep %s" % (container_name)
    with Popen(["docker" ,"stats"], stdout=PIPE, stderr=None) as process:
        time.sleep(4.0)
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

def rmSwarmMsg(msg) :
    msg = msg.split("\n")
    n_msg = ""
    for m in msg :
        m = m.split("|")
        if len(m) > 1 :
            n_msg += m[1] + "\n"
    return n_msg

# get the logs of the container with docker logs
def getContainerLogs(container_name, user_id) :
    service_name = "%s-%s_%s" % (user_id, container_name, container_name)
    cmd = "sudo docker service logs %s" % (service_name)
    with Popen(cmd, stdout=PIPE, stderr=None, shell=True) as process:
        output = process.communicate()[0].decode("utf-8")
        rc = process.returncode # get return code of execution
        if rc == 0 :
            # return code = 0, meaning execute successfully
            return rmSwarmMsg(output)
        else :
            # otherwise, meaning execute failed
            return "false"

def extractImageFromDockerServicePs(output) :
   output = output.split('\n')[1].split(' ')
   # image is display on third filed
   field_index = 0
   for s in output :
       if s != '' :
          field_index += 1 
       if field_index == 3 :
           return s
   return "false"

# get the image name of the container with docker logs
def getContainerImage(container_name, user_id) :
    service_name = "%s-%s_%s" % (user_id, container_name, container_name)
    cmd = "sudo docker service ps %s" % (service_name)
    with Popen(cmd, stdout=PIPE, stderr=None, shell=True) as process:
        output = process.communicate()[0].decode("utf-8")
        rc = process.returncode # get return code of execution
        if rc == 0 :
            # return code = 0, meaning execute successfully
            return extractImageFromDockerServicePs(output)
        else :
            # otherwise, meaning execute failed
            return "false"

if __name__ == "__main__":
    print(main(container_name, info_type, user_id))
