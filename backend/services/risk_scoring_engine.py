class RiskScoringEngine:
    @staticmethod
    def calculate_risk(
        zombie_apis: int,
        shadow_apis: int,
        missing_authentication: int,
        unencrypted_api: int,
        missing_rate_limit: int,
        data_exposure: int
    ) -> tuple[float, str]:
        
        # Risk formula
        raw_score = (
            (zombie_apis * 12) +
            (shadow_apis * 8) +
            (missing_authentication * 15) +
            (unencrypted_api * 20) +
            (missing_rate_limit * 10) +
            (data_exposure * 25)
        )
        
        normalized_score = min(raw_score, 100.0)
        
        # Risk levels
        if normalized_score <= 30:
            level = "Low"
        elif normalized_score <= 70:
            level = "Medium"
        else:
            level = "High"
            
        return normalized_score, level
