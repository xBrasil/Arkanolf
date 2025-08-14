import os
import shutil
from flask_frozen import Freezer
from app import app

# Configurando o freezer para a aplicação Flask
freezer = Freezer(app)

# Caminho do diretório 'build' onde os arquivos congelados serão armazenados
build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')

# Função para apagar a pasta /build/ se ela existir
def clean_build_dir():
    if os.path.exists(build_dir):
        print(f"Apagando o diretório: {build_dir}")
        shutil.rmtree(build_dir)
    else:
        print(f"Diretório {build_dir} não encontrado. Nenhuma ação necessária.")

# Função para mover arquivos QUE DEVERIAM terminar em .html (desisti) da pasta build para o diretório raiz COM .html
def copy_html_files():
    source_dir = os.path.join(os.getcwd(), 'build')
    destination_dir = os.getcwd()
    templates_dir = os.path.join(os.getcwd(), 'templates')

    # Verifica se a pasta build existe
    if os.path.exists(source_dir):
        for file_name in os.listdir(source_dir):
            # Verifica se o arquivo sem extensão corresponde a um arquivo .html no templates/
            if not file_name.endswith('.html'):
                template_file = f"{file_name}.html"
                if template_file in os.listdir(templates_dir):
                    source_file = os.path.join(source_dir, file_name)
                    destination_file = os.path.join(destination_dir, f"{file_name}.html")
                    shutil.copy(source_file, destination_file)  # Copia o arquivo e adiciona a extensão .html
                    print(f"Arquivo {file_name} copiado e renomeado para {file_name}.html na pasta raiz.")
    else:
        print("A pasta 'build' não foi encontrada. Verifique se o processo de congelamento foi concluído com sucesso.")

if __name__ == '__main__':
    # Limpar o diretório /build/ antes de congelar o projeto
    clean_build_dir()

    # Definindo que o ambiente é de produção (para gerar o HTML correto no Flask-Frozen)
    app.config['DEPLOY_ENV'] = True

    # Executar o processo de congelamento
    freezer.freeze()

    # Copiar os arquivos HTML da pasta build para a raiz do projeto
    copy_html_files()
