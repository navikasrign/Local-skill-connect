import subprocess
import sys
import time

def run():
    print("Launching server...")
    server = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=r"c:\Local skill connect"
    )
    time.sleep(2)
    try:
        print("Running test_lifecycle_backend.py...")
        res = subprocess.run([sys.executable, "test_lifecycle_backend.py"], cwd=r"c:\Local skill connect", capture_output=True, text=True)
        print("STDOUT:\n", res.stdout)
        if res.stderr:
            print("STDERR:\n", res.stderr)
        assert res.returncode == 0, "test_lifecycle_backend failed"
        print("Lifecycle test passed successfully!")
    finally:
        server.terminate()
        server.wait(timeout=3)

if __name__ == "__main__":
    run()
