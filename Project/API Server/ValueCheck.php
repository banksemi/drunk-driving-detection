<?
    class ValueCheck
    {
        const Option_NotSpace = 0;
        public static function String($value, $message, $option = null)
        {
            if ($value == null || trim($value) == "")
            {
                ErrorExit($message);
            }

            if ($option === self::Option_NotSpace)
            {

                if (strpos($value," "))
                {
                    ErrorExit("입력한 문자열에 공백을 포함시킬 수 없는 변수가 있습니다.");
                }
            }
        }

        public static function Boolean($value, $message)
        {
            if ($value === true || $value === "true")
                return true;
            if ($value === false || $value === "false")
                return false;
            ErrorExit($message);
        }
    }
?>