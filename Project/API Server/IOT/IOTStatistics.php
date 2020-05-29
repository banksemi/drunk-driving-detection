<?
    class IOTStatistics
    {
        public static $methods = array("count","max","min", "avg", "sum");
        public static $day = -1;
        public static $week = -2;
        public static $month = -3;
        private static function UpdateByEachHour($method)
        {
            // 임시로  WHERE DATE(`date`) >= DATE((NOW() - INTERVAL 1 day)) 삭제
            $result = Mysql::Open(
                "INSERT 
                    INTO iot_statistics_n2(`application_no`, `key`, `date`, `time`, `statistics_method`, `data`)
                    SELECT t.`application_no`, t.`key`, t.`date`, t.`time`, ?, t.`data` FROM
                        (SELECT `application_no`, `key`, `date`, hour(`date`) as `time`, $method(CAST(`value` AS DOUBLE)) as `data` 
                            FROM iot_data_n
                            GROUP BY `application_no`, `key`, DATE_FORMAT(`date`, '%Y-%m-%d %H')
                        ) 
                    AS t
                ON DUPLICATE KEY UPDATE `data`=`t`.`data`", $method
            );
        }

        private static function UpdateByEachDay($method)
        {
            $real_method = $method;
            if ($method == "count")
                $real_method = "sum";
                
            $result = Mysql::Open(
                "INSERT 
                    INTO iot_statistics_n2(`application_no`, `key`, `date`, `time`, `statistics_method`, `data`)
                    SELECT t.`application_no`, t.`key`, t.`date`, t.`time`, t.`statistics_method`, t.`data` FROM
                        (SELECT `application_no`, `key`, `date`, ? as `time`,`statistics_method`,  $real_method(CAST(`data` AS DOUBLE)) as `data` 
                            FROM iot_statistics_n2 WHERE `statistics_method` = ? and `time` >= 0
                            GROUP BY `application_no`, `key`, `date`
                        ) 
                    AS t
                ON DUPLICATE KEY UPDATE `data`=`t`.`data`", self::$day, $method
            );
        }

        private static function UpdateByEachWeek($method)
        {
            $real_method = $method;
            if ($method == "count")
                $real_method = "sum";
                
            $result = Mysql::Open(
                "INSERT 
                    INTO iot_statistics_n2(`application_no`, `key`, `date`, `time`, `statistics_method`, `data`)
                    SELECT t.`application_no`, t.`key`, t.`date`, t.`time`, t.`statistics_method`, t.`data` FROM
                        (SELECT `application_no`, `key`, min(`date`) as `date`, ? as `time`,`statistics_method`,  $real_method(CAST(`data` AS DOUBLE)) as `data` 
                            FROM iot_statistics_n2 WHERE `statistics_method` = ? and `time` = ?
                            GROUP BY `application_no`, `key`, YEARWEEK(`date`)
                        ) 
                    AS t
                ON DUPLICATE KEY UPDATE `data`=`t`.`data`", self::$week, $method, self::$day
            );
        }

        public static function Update()
        {
            foreach (self::$methods as $method) {
                self::UpdateByEachHour($method);
                self::UpdateByEachDay($method);
                self::UpdateByEachWeek($method);
            }
        }
    }
?>