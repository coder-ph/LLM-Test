from dotenv import load_dotenv
from alembic.config import Config
from alembic import command

load_dotenv()  

alembic_cfg = Config("alembic.ini")

command.upgrade(alembic_cfg, "head")
