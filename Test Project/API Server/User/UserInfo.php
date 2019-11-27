<?
    class UserInfo
    {
        public $level = -1;
        public $id;
        public $password_hash;
        public $name;
        public $phone;
        public $address;
        public $email;
        public $branch_id;
        public $branch_name;
        private static $instance = null;
        public static function GetInstance()
        {
            if (self::$instance == null || self::$instance->id !== $_SESSION["id"])
                self::$instance = new UserInfo($_SESSION["id"]);
            return self::$instance;
        }

        function __construct($id) 
        {
            if ($id != null)
            {
                $result = Mysql::Open("SELECT * FROM user JOIN branch ON user.branch_id=branch.branch_id WHERE id = ?", $id);
                if ($row = $result->fetch_assoc())
                {
                    $this->level = $row["level"];
                    $this->id = $row["id"];
                    $this->password_hash = $row["password"];
                    $this->phone = $row["phone"];
                    $this->name = $row["name"];
                    $this->address = $row["address"];
                    $this->email = $row["email"];
                    $this->branch_id = $row["branch_id"];
                    $this->branch_name = $row["branch_name"];
                }
            }
        }

        public static function InstanceFromUUID($uuid) {
            $result = Mysql::Open("SELECT * FROM user JOIN branch ON user.branch_id=branch.branch_id WHERE uuid is not null and uuid=?", $uuid);
            if ($row = $result->fetch_assoc())
            {
                return new UserInfo($row["id"]);
            }
            return new UserInfo(null);
        }

        public function PasswordCheck($password)
        {
            return $this->password_hash == hash('sha256', $password);
        }

        public static function Create($id, $uuid, $branch) {
            $result = Mysql::Insert("user", 
                array("id", "uuid", "branch_id"), 
                array($id, $uuid, $branch)
            );
            return $result;
        }
    }
?>