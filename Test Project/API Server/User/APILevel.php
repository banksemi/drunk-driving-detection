<?
    class APILevel
    {
        public static $checked = false;
        const guest = -1; // 로그인을 하지 않은 경우
        const login = 0; // 일반 학생
        const student = 0; // 일반 학생
        const teacher = 1; // 지점에 있는 선생님 (권한 제한, 출결 확인만 가능, 학원의 세부 정보 확인 불가)
        const partner = 2; // 파트너 (해당 지점의 모든 권한 획득) - 일반적으로 사용
        const secondary_admin = 3; // 파트너 (새로운 지점을 생성하고 목록을 확인할 수 있지만, 세부 사항 수정 불가)
        const admin = 4; // 모든 권한 획득
        public static function Need($level)
        {
            self::$checked = true;
            $user = UserInfo::GetInstance();
            if ($user->level < $level)
            {
                if ($user->level == self::guest)
                    ErrorExit("이 액션을 수행하려면 로그인이 필요합니다.", -1);
                else
                    ErrorExit("이 계정은 해당 액션에 대한 권한이 없습니다. 관리자에게 문의해주세요.", 0);
            }
        }
    }
?>