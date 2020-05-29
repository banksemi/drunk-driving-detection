<?
    class IOTApplication
    {
        public $vaildation = false; // 유효한 토큰으로 만들어진 오브젝트인가

        private $token;
        function __construct($token) 
        {
            $this->token = $token;

            $result = Mysql::Open("SELECT * from iot_token WHERE token=?", $this->token);
            if ($row = $result->fetch_assoc()) 
            {
                $this->vaildation = true;
            }
        }

        public function Read($key, $limit = 1)
        {
            if ($limit== null && $limit !== 0)
            {
                $limit = 1;
            }
            $list = array();
            $result = Mysql::Open("SELECT * from iot_data WHERE token=? and `key`=? ORDER BY no DESC limit ?",
            $this->token, $key, $limit);
            while ($row = $result->fetch_assoc()) 
            {
                $data = new stdClass();
                $data->value = $row["value"];
                $data->datetime = $row["date"];
                if ($row["device"] != null)
                    $data->device = $row["device"];
                array_push($list, $data);
            }
            return $list;
        }

        public function Insert($key, $value, $device = null)
        {
            $result = Mysql::Insert("iot_data", 
                array("token", "key", "value", "device"),
                array($this->token, $key, $value, $device)
            );
            return $result;
        }
    }
?>