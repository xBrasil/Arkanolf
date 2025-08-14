0) para TESTAR, apenas:
python app.py
> parar: control+c no terminal

1) para DEPLOY:
python freeze.py // só se tiver alterado os HTML ou CSS
git add .
git commit -m "Descrever atualização"
git push -u origin main
python backup.py