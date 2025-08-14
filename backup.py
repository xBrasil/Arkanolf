import os
import shutil
import re
import zipfile
from pathlib import Path
import sys

def get_game_version(game_js_path):
    """
    Extrai a versão do jogo do arquivo game.js.
    Espera-se que a versão esteja na quarta linha no formato:
    const GAME_VERSION = '0.8.1';
    """
    try:
        with open(game_js_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            if len(lines) < 4:
                print("Erro: O arquivo game.js tem menos de 4 linhas.")
                sys.exit(1)
            fourth_line = lines[3].strip()
            # Usar regex para extrair a versão
            match = re.search(r"const\s+GAME_VERSION\s*=\s*'([^']+)';", fourth_line)
            if match:
                return match.group(1)
            else:
                print("Erro: Não foi possível encontrar GAME_VERSION na quarta linha.")
                sys.exit(1)
    except FileNotFoundError:
        print(f"Erro: O arquivo {game_js_path} não foi encontrado.")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao ler o arquivo {game_js_path}: {e}")
        sys.exit(1)

def create_val_folder(base_path, version):
    """
    Cria a pasta "VAL Python xxx" onde xxx é a versão do jogo.
    """
    folder_name = f"VAL Python {version}"
    folder_path = base_path / folder_name
    try:
        folder_path.mkdir(exist_ok=False)
        print(f"Pasta criada: {folder_path}")
        return folder_path
    except FileExistsError:
        print(f"Erro: A pasta {folder_path} já existe.")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao criar a pasta {folder_path}: {e}")
        sys.exit(1)

def copy_contents(src, dest, exclude_folders):
    """
    Copia todo o conteúdo de src para dest, excluindo as pastas especificadas.
    """
    try:
        for item in src.iterdir():
            if item.name in exclude_folders:
                print(f"Desconsiderando pasta: {item}")
                continue
            dest_item = dest / item.name
            if item.is_dir():
                shutil.copytree(item, dest_item)
                print(f"Pasta copiada: {item} -> {dest_item}")
            else:
                shutil.copy2(item, dest_item)
                print(f"Arquivo copiado: {item} -> {dest_item}")
    except Exception as e:
        print(f"Erro ao copiar conteúdo de {src} para {dest}: {e}")
        sys.exit(1)

def create_zip(source_folder, zip_path):
    """
    Cria um arquivo ZIP a partir da pasta source_folder.
    """
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(source_folder):
                for file in files:
                    file_path = Path(root) / file
                    # Adicionar arquivo ao ZIP com caminho relativo
                    zipf.write(file_path, file_path.relative_to(source_folder.parent))
        print(f"Arquivo ZIP criado: {zip_path}")
        return True
    except Exception as e:
        print(f"Erro ao criar o arquivo ZIP {zip_path}: {e}")
        return False

def delete_folder(folder_path):
    """
    Apaga a pasta especificada.
    """
    try:
        shutil.rmtree(folder_path)
        print(f"Pasta apagada: {folder_path}")
    except Exception as e:
        print(f"Erro ao apagar a pasta {folder_path}: {e}")
        sys.exit(1)

def move_zip(zip_path, destination):
    """
    Move o arquivo ZIP para o destino especificado.
    """
    try:
        shutil.move(str(zip_path), str(destination))
        print(f"Arquivo ZIP movido para: {destination}")
    except Exception as e:
        print(f"Erro ao mover o arquivo ZIP {zip_path} para {destination}: {e}")
        sys.exit(1)

def main():
    # Diretório atual onde o script está sendo executado
    current_dir = Path(__file__).parent.resolve()
    
    # Caminho para o arquivo game.js
    game_js_path = current_dir / 'static' / 'js' / 'game.js'
    
    # Passo 1: Extrair GAME_VERSION
    game_version = get_game_version(game_js_path)
    print(f"GAME_VERSION encontrado: {game_version}")
    
    # Passo 2: Criar a pasta "VAL Python xxx"
    val_folder = create_val_folder(current_dir, game_version)
    
    # Passo 3: Copiar o conteúdo, excluindo ".git" e "__pycache__"
    exclude_folders = ['.git', '__pycache__', '.venv', 'node_modules', f"VAL Python {game_version}"]
    copy_contents(current_dir, val_folder, exclude_folders)
    
    # Passo 4: Criar o arquivo ZIP
    zip_name = f"VAL Python {game_version}.zip"
    zip_path = current_dir / zip_name
    success = create_zip(val_folder, zip_path)
    
    if success:
        # Passo 5: Apagar a subpasta
        delete_folder(val_folder)
        
        # Passo 6: Mover o ZIP para a pasta superior
        parent_dir = current_dir.parent
        final_backup_folder = parent_dir / "VAL Python backups"
        move_zip(zip_path, final_backup_folder)
    else:
        print("Erro: O arquivo ZIP não foi criado. A pasta não será apagada.")
        sys.exit(1)

if __name__ == "__main__":
    main()
