data=open('app.py','r').readlines(); data[921]='    \n'; open('app.py','w').writelines(data); print('Fixed line 922')
