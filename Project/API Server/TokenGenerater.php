<?
    class TokenGenerater
    {
        const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        public $length;
        public $includeDate;
        public function Generate()
        {
            $charactersLength = strlen(self::characters);
            $randomString = '';
            if ($this->includeDate)
            {
                $date = hash('sha256', microtime(true));
                if (strlen($date) >= $this->length)
                    return substr($date, 0, $this->length);
                else
                    $randomString = $date;
            }

            for ($i = strlen($randomString); $i < $this->length; $i++) {
                $randomString .= self::characters[rand(0, $charactersLength - 1)];
            }
            return $randomString;
        }
    }
?>