<?
    class IOTValueType
    {
        const v_number = 0;
        const v_string = 1;
        const v_boolean = 2;
        const v_color = 3;

        public static function ErrorCode($type = self::v_number)
        {
            return -100 - $type;
        }

        // 변수 리스트를 가져올 때 사용
        public static function ToString($number)
        {
            $number = (int)$number;
            if ($number == self::v_number)
                return "number";
            if ($number == self::v_string)
                return "string";
            if ($number == self::v_boolean)
                return "boolean";
            if ($number == self::v_color)
                return "color";

            return $number;
        }

        // 변수를 생성할 때  string 과 같은 문자열 정보를 인덱스(v_number, v_...)으로 변환
        public static function ToInt($string)
        {
            if ($string == "number")
                return self::v_number;
            if ($string == "string")
                return self::v_string;
            if ($string == "boolean")
                return self::v_boolean;
            if ($string == "color")
                return self::v_color;

            return self::ErrorCode();
        }

        // 사용자의 인풋을 확인할 때 사용되는 함수. null 반환시 오류로 처리
        public static function ValueCheck($type, $value)
        {
            if ($type === IOTValueType::v_number)
            {
                if (!is_numeric($value))
                    return null;
                else
                    return (int)$value;
            }
            if ($type === IOTValueType::v_string)
            {
                return $value;
            }
            if ($type === IOTValueType::v_boolean)
            {
                if ($value == "true")
                    return 1;
                else if ($value == "false")
                    return 0;
                else
                    return null;
            }
            if ($type === IOTValueType::v_color)
            {
                if (strlen($value) != 6) return null;
                if (ctype_xdigit($value) == false) return null;
                $value = strtoupper($value);
                return $value;
            }
            // 일반 타입이 없으면 그냥 통과를 시킴
            // 변수가 없을 경우 어차피 데이터베이스에서 저장되지 않기 때문
            return $value;
        }

        public static function ErrorMessage($code)
        {
            if ($code == IOTValueType::ErrorCode(IOTValueType::v_number))
                return "Number 타입에는 숫자만 들어갈 수 있습니다.";

            if ($code == IOTValueType::ErrorCode(IOTValueType::v_boolean))
                return "Boolean 타입에는 true, false만 들어갈 수 있습니다.";
                
            if ($code == IOTValueType::ErrorCode(IOTValueType::v_color))
                return "Color 타입에는 6자리로 구성된 16진수 데이터만 들어갈 수 있습니다.";
                
            return null;
        }
    }
?>