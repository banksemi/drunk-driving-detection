<?
    class DebugOption
    {
        public static function ChangeGetToPostValue()
        {
            foreach($_GET as $query_string_variable => $value) {
                $_POST[$query_string_variable] = $value;
            }
        }
    }
?>