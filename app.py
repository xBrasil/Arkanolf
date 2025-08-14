import os
from flask import Flask, render_template

class Config:
    # Define se é um ambiente de produção para Flask-Frozen
    DEPLOY_ENV = False  # Modo padrão é desenvolvimento (isso será alterado no freeze.py)

# Criação da aplicação Flask
app = Flask(__name__)
app.config.from_object(Config)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index')
def index_html():
    return render_template('index.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/license')
def license():
    return render_template('license.html')

if __name__ == '__main__':
    # No modo de desenvolvimento, não estamos em produção
    app.config['DEPLOY_ENV'] = False
    app.run(debug=True)
