<?
    class IOTTemplate
    {
        public $name;
        public $layout = null;
        public $values = null;
        public $emptyLayout = false;
        function __construct($name) 
        {
            $this->name = $name;

            // PHP 파일 이름이 들어간 절대 서버 경로
            $file_server_path = realpath(__FILE__);

            // API 폴더 경로
            $file_path = str_replace(basename(__FILE__), "", $file_server_path)."Templates/".$name.".json";
            if (file_exists($file_path))
            {            
                $fp = fopen($file_path ,"r"); 
                $fr = fread($fp, filesize($file_path));
                $data = json_decode($fr);
                $this->layout = $data->layout;
                $this->values = $data->values;
                fclose($fp);

                for ($i=0; $i < count($this->layout); $i++) { 
                    for ($j=0; $j < count($this->layout[$i]); $j++) { 
                        if ($this->layout[$i][$j]->createTime == null)
                        {
                            $this->layout[$i][$j]->createTime = time().'.'.$i.'.'.$j;
                        }
                    }
                }
    
                if ($this->values == null)
                {
                    ErrorExit("템플릿이 JSON 형식에 맞지 않습니다.");
                }
            }
        }

        public function Apply($IotApplication)
        {
            if ($this->layout == null || $this->values == null)
                return -200;
            
            Mysql::BeginTransaction();
            $error = 0;

            // 레이아웃을 제외하지 않는 경우에만 변경
            if ($this->emptyLayout == false)
                $error += $IotApplication->ChangeLayout($this->layout, "json");

            // 변수는 모든 경우에 추가
            foreach ($this->values as $key => $type) {
                $error += $IotApplication->CreateValue($key, $type);
            }

            if ($error != 0)
            {
                Mysql::Rollback();
                return -101;
            }
            else
            {
                Mysql::Commit();
                return 0;
            }
        }
    }
?>