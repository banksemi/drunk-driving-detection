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
            if (self::$instance == null)
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

        public function PasswordCheck($password)
        {
            return $this->password_hash == hash('sha256', $password);
        }
    }
?>