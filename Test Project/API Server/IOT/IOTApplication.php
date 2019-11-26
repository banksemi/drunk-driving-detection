<?
    class IOTApplication
    {
        public $vaildation = false; // 유효한 토큰으로 만들어진 오브젝트인가

        public $name;
        public $description;
        public $layout;

        public $token;
        public $no;

        public static function Create($user, $application_name, $description = null, $template = null, $empty_layout = false)
        {
            $tokenGenerater = new TokenGenerater();
            $tokenGenerater->length = 64;
            $tokenGenerater->includeDate = true;
            $token =  $tokenGenerater->Generate();
            $result = Mysql::Insert("iot_token_n", 
                array("user_id", "application_name", "description", "token"), 
                array($user->id, $application_name, $description, $token)
            );
            if ($result != 0)
                return $result;

            $iotApp = new IOTApplication($token);
            $templateObject = new IOTTemplate($template);
            $templateObject->emptyLayout = $empty_layout;
            $templateObject->Apply($iotApp);
            return $iotApp;
        }

        function __construct($token) 
        {
            $this->token = $token;

            $result = Mysql::Open("SELECT * from iot_token_n WHERE token=?", $this->token);
            if ($row = $result->fetch_assoc()) 
            {
                $this->vaildation = true;
                $this->name = $row["application_name"];
                $this->description = $row["description"];
                $this->no = $row["application_no"];
                $this->layout = json_decode($row["layout"]);

                if ($this->layout == null)
                {
                    $this->layout = array();
                }
            }
        }

        public static function GetToken($user, $application_name)
        {
            $result = Mysql::Open("SELECT * from iot_token_n WHERE `user_id`=? and `application_name`=?", $user->id, $application_name);
            if ($row = $result->fetch_assoc()) 
            {
                return $row["token"];
            }
            return null;
        }

        public function Read($key, $limit = 1)
        {
            if ($limit== null && $limit !== 0)
            {
                $limit = 1;
            }
            $list = array();
            $result = Mysql::Open("SELECT * from iot_data_n WHERE `application_no`=? and `key`=? ORDER BY no DESC limit ?",
            $this->no, $key, $limit);
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

            $value_info = $this->GetValueInfo($key);
            $value_type = $value_info->type;
            $value = IOTValueType::ValueCheck($value_type, $value);

            if ($value === null)
                return IOTValueType::ErrorCode($value_type);

            $result = Mysql::Insert("iot_data_n", 
                array("application_no", "key", "value", "device"),
                array($this->no, $key, $value, $device)
            );
            // 성공했을 때만 데이터 갱신 일자 수정
            if ($result == 0)
            {
                $time = date("Y-m-d H:i:s", time());
                Mysql::Open(
                    "INSERT 
                        INTO iot_last_update(`application_no`, `last_update`) VALUES (?, ?)
                     ON DUPLICATE 
                        KEY UPDATE `last_update`=?", $this->no, $time, $time
                );
            }
            return $result;
        }

        public function CreateValue($key, $type, $description = null)
        {
            $type = IOTValueType::ToInt($type);
            if ($type == IOTValueType::ErrorCode())
                return $type;

            $result = Mysql::Insert("iot_value_n", 
                array("application_no", "key_name", "type", "description"),
                array($this->no, $key, $type, $description)
            );
            return $result;
        }

        public function ChangeLayout($design, $type="string")
        {
            if ($type=="string")
            {
                $json = $design;
            }
            else
            {
                $json = json_encode($design, JSON_UNESCAPED_UNICODE);
            }
            $result = Mysql::Open("UPDATE iot_token_n SET `layout` = ? WHERE `application_no` = ?", $json, $this->no);
            if ($result == 0)
            {
                $this->layout = json_decode($json);
            }
            return $result;
        }

        public function AddComponentInLayout($count)
        {
            $count = (int)$count;
            $row = array();
            for ($i=0; $i < $count; $i++) { 
                $item = new stdClass();
                $item->createTime = time().'.'.$i;
                $item->name = "컴포넌트 디자인 (".($i+1)." 번째 컬럼)";
                $item->mode = 'undefined';
                array_push($row, $item);
            }
            array_push($this->layout, $row);
            return $this->ChangeLayout($this->layout, "json");
        }

        public function ModifyComponentInLayout($createTime, $component)
        {    
            $component->createTime = $createTime;
            // 컴포넌트 변수 확인
            foreach ($component->value as $value) {
                if (!$this->ContainsValue($value->name))
                {
                    return $value->name." 변수는 존재하지 않습니다.";
                }
            }
            for ($i=0; $i < count($this->layout); $i++) { 
                for ($j=0; $j < count($this->layout[$i]); $j++) { 
                    if ($this->layout[$i][$j]->createTime == $createTime)
                    {
                        $this->layout[$i][$j] = $component;
                        return $this->ChangeLayout($this->layout, "json");
                    }
                }
            }
          return -1;
        }

        public function DeleteComponentInLayout($createTime)
        {
            
            for ($i=0; $i < count($this->layout); $i++) {
                $this->layout[$i] = array_values(
                    array_filter($this->layout[$i], function($var) use($createTime) {
                        return $var->createTime != $createTime;
                    }
                ));
            }

            $this->layout = array_values(
                array_filter($this->layout, function($var) {
                    return count($var) != 0;
                }
            ));
            return $this->ChangeLayout($this->layout, "json");
        }

        public function DeleteValue($key)
        {

        }

        public function ContainsValue($key)
        {
            return $this->GetValueInfo($key) !== null;
        }

        public function GetValueInfo($key)
        {
            $result = Mysql::Open("SELECT * from iot_value_n WHERE `application_no`=? and `key_name`=?", $this->no, $key);
            if ($row = $result->fetch_assoc()) 
            {
                $data = new stdClass();
                $data->type = $row["type"];
                $data->key_no = $row["key_no"];

                return $data;
            }
            return null;
        }

        public function GetValueList()
        {
            $list = array();
            $result = Mysql::Open("SELECT * from iot_value_n WHERE `application_no`=?", $this->no);
            while ($row = $result->fetch_assoc()) 
            {
                $data = new stdClass();
                $data->name = $row["key_name"];
                if ($row["description"] != null)
                    $data->description = $row["description"];
                $data->type = IOTValueType::ToString($row["type"]);
                array_push($list, $data);
            }
            return $list;
        }

        public function DeleteApplication()
        {
            $result = Mysql::Open("DELETE FROM iot_token_n WHERE `application_no`=?", $this->no);
            return $result;
        }
        
        public function Statistics()
        {
            $base = $this->layout;
            if ($this->layout == null)
            {
                return [];
            }
            foreach($this->layout as $row) {
                foreach($row as $option) {

                    if (!is_array($option->value))
                    {
                        $temp = new stdClass();
                        $temp->name = $option->value;
                        $option->value = [$temp];
                    }
                    if ($option->name == null) 
                    {
                        $option->name = $option->value[0]->name; //implode( ', ', $option->value );
                    }
                    $read_size = 0;
                    if ($option->mode == "getLastData")
                    {
                        $read_size = 1;
                    }
                    else if ($option->mode == "switch")
                    {
                        $list = array("primary", "success", "info", "warning");
                        if (in_array($option->type, $list) == false) $option->type = "primary";

                        if ($option->icon == null)
                            $option->icon = "nb-lightbulb";
                            
                        $read_size = 1;
                    }
                    else if ($option->mode =="pieGraph")
                    {
                        if ($option->min == null) $option->min = 0;
                        if ($option->max == null) $option->max = 100;
                        
                        $read_size = 1;
                    }
                    else if ($option->mode == "list")
                    {
                        if ($option->cardSize == null) $option->cardSize = "medium";
                        $read_size = 50;
                    }
                    else if ($option->mode == "barChart")
                    {
                        $read_size = 50;
                    }

                    $data = array();

                    foreach ($option->value as $value) {
                        if ($option->group != null)
                        {
                            $value->group = $option->group;
                        }
                        if ($value->group == null || $value->group == "each")
                        {
                            array_push($data, $this->Read($value->name, $read_size));
                        }
                        else
                        {
                            if ($value->method == null)
                                $value->method = "count";

                            
                            $list = array();
                            if ($value->group == "hour")
                            {
                                $result = Mysql::Open("SELECT * from iot_statistics_n2 WHERE `application_no`=? and `key`=? and `time` >= 0 and `statistics_method` = ? ORDER BY `date` DESC LIMIT 24", 
                                $this->no, $value->name, $value->method);
                                while ($row = $result->fetch_assoc()) 
                                {
                                    $item = new stdClass();
                                    $item->datetime = $row["date"]." ".sprintf("%02d시",$row["time"]);
                                    $item->value = $row["data"];
                                    array_push($list, $item);
                                }
                            }

                            if ($value->group == "day")
                            {
                                $result = Mysql::Open("SELECT * from iot_statistics_n2 WHERE `application_no`=? and `key`=? and `time` = ? and `statistics_method` = ? ORDER BY `date` DESC LIMIT 30", 
                                $this->no, $value->name, IOTStatistics::$day, $value->method);
                                while ($row = $result->fetch_assoc()) 
                                {
                                    $item = new stdClass();
                                    $item->datetime = $row["date"];
                                    $item->value = $row["data"];
                                    array_push($list, $item);
                                }
                            }

                            array_push($data, $list);
                        }
                    }
                    $option->data = $data;
                }
            }
            return $base;
        }

    }
?>