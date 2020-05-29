<?
	function sess_open( $save_path, $session_name ) 
	{
		return true;
	}

	function sess_close() 
	{ 
		return true; 
	}

	function sess_read($key) 
	{ 
        $result = Mysql::Open("SELECT data FROM session WHERE phpsessid = ? and ip=? and user_agent=? and expiry > ?", 
            $key, 
            $_SERVER['REMOTE_ADDR'],
            $_SERVER['HTTP_USER_AGENT'], 
            time()
        );
        
		if (list($value) = $result->fetch_row())
		{
			// var_dump($value);
			return $value;
		}
		else
		{
            Mysql::Open("DELETE FROM session WHERE phpsessid = ? and ip=? and user_agent=?", 
                $key, 
                $_SERVER['REMOTE_ADDR'],
                $_SERVER['HTTP_USER_AGENT']
            );
		}
		return false; 
	}

	function sess_write( $key, $val ) 
	{
		GLOBAL $mysqlconn;
		GLOBAL $session_maxtime;
		// addslashes로 문자 부호 를 변환시 오류 발생
		$value = $val; 
		$time = time();
		$time_e = time() + Setting::$session_maxtime;
        $result = Mysql::Open(
			"INSERT 
				INTO session(`phpsessid`, `data`, `start`, `expiry`, `ip`, `user_agent`) VALUES (?, ?, ?, ?, ?, ?)
			 ON DUPLICATE 
				KEY UPDATE `data`=?, `expiry`=?", 
				$key, $value, $time, $time_e, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'],
				$value, $time_e
		);
		return $result == 0;
	}

	function sess_destroy( $key ) 
	{ 
        Mysql::Open("DELETE FROM session WHERE phpsessid = ?", $key);

		return true;
	} 

	function sess_gc( $maxlifetime ) 
	{ 
		/*
		global $DB_CONN; 

		$sess_query = "DELETE FROM session WHERE expiry < " . time(); 
		$sess_result = mysql_query( $sess_query, $DB_CONN ); 

		return mysql_affected_rows( $DB_CONN ); 
		*/
		return 0;
	}
	session_set_save_handler ("sess_open", "sess_close", "sess_read", "sess_write", "sess_destroy", "sess_gc");

?>