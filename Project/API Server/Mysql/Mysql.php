<?
    class Mysql
    {
        private static $opend_mysqli = null;
        private function Init()
        {
            if (self::$opend_mysqli == null)
            {
                self::$opend_mysqli = new mysqli(MysqlSetting::$serverDomain, MysqlSetting::$username, MysqlSetting::$password, MysqlSetting::$database);    
            }
        }
        static function BeginTransaction()
        {
            self::Init();
            self::$opend_mysqli->begin_transaction();
        }
        
        static function Commit()
        {
            self::Init();
            self::$opend_mysqli->commit();
        }
        static function Rollback()
        {
            self::Init();
            self::$opend_mysqli->rollback();
        }

        static function Open($message)
        {
            self::Init();
            $stmt = self::$opend_mysqli->prepare($message);
            if (func_num_args() > 1)
            {
                $params = func_get_args();
                $params[0] = "";
                for( $i = 1; $i < func_num_args(); $i++ ) {
                    $params[0] .= "s";
                }
                // MYSQL에서 인자값을 참조하기 때문에
                $tmp = array();
                foreach($params as $key => $value) $tmp[$key] = &$params[$key];
                call_user_func_array(array($stmt, 'bind_param'), $tmp);
            }
            $stmt->execute();
        
            $result = $stmt->get_result();
            $errno = $stmt->errno;
            $stmt->close();
            if ($result == false)
            {
                return $errno;
            }
            else
                return $result;
        }

        static function Insert($table, $field, $values)
        {

            $field_message = "";
            $values_message = "";
            for( $i = 0; $i < count($values); $i++ ) {
                if ($i != 0)
                {
                    $field_message .= ',';
                    $values_message .= ',';
                }
                $field_message .= '`'.$field[$i].'`';
                $values_message .= "?";
            }
            $message = "insert into `".$table.'`('.$field_message.') VALUES ('.$values_message.')';
            array_unshift($values, $message);
    
            return call_user_func_array("self::Open", $values);
        }
        static function AllClose()
        {
            if (self::$opend_mysqli != null)
            {
                self::$opend_mysqli->close();
            }
        }
    }
?>