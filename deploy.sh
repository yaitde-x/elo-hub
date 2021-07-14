
ssh pi@pi3_hub "sudo systemctl stop elo_hub"
scp elo_hub_v1 pi@pi3_hub:~/
ssh pi@pi3_hub "sudo systemctl start elo_hub"
