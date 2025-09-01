# train.py
import argparse, time

if __name__ == "__main__":
    p = argparse.ArgumentParser(); p.add_argument("--epochs", type=int, default=1); args = p.parse_args()
    for e in range(args.epochs):
        print(f"[epoch {e+1}] training…"); time.sleep(1)
    print("done")

