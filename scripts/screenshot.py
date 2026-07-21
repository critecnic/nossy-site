import subprocess, time

# Start server
subprocess.Popen(
    ["node", ".next/standalone/server.js"],
    cwd="/home/z/my-project",
    stdout=open("/tmp/prod.log", "w"),
    stderr=subprocess.STDOUT,
    stdin=subprocess.DEVNULL,
    start_new_session=True
)

# Wait for server
for i in range(20):
    time.sleep(1)
    try:
        r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "3", "http://localhost:3000/"], capture_output=True, text=True, timeout=5)
        if "200" in r.stdout:
            print(f"Server ready after {i+1}s")
            break
    except:
        pass

# Take screenshots
time.sleep(2)

screenshots = [
    ("/home/z/my-project/download/ww-hero.png", "--viewport 1440 900"),
    ("/home/z/my-project/download/ww-mobile.png", "--viewport 390 844"),
]

for path, vp in screenshots:
    result = subprocess.run(
        f"agent-browser open http://localhost:3000/ {vp} 2>&1",
        shell=True, capture_output=True, text=True, timeout=15
    )
    print(f"Open: {result.stdout[:200]} {result.stderr[:200]}")
    time.sleep(3)
    
    result = subprocess.run(
        f"agent-browser screenshot {path} --full 2>&1",
        shell=True, capture_output=True, text=True, timeout=15
    )
    print(f"Screenshot: {result.stdout[:200]} {result.stderr[:200]}")
    time.sleep(1)

subprocess.run("agent-browser close 2>/dev/null", shell=True)
print("Done!")
