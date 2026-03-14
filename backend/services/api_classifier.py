import re

class APIClassifier:
    @staticmethod
    def classify(endpoint: str, is_documented: bool, all_endpoints: list[str]) -> str:
        # Check for deprecated (v1 vs v2, v3)
        version_match = re.search(r'/v(\d+)/', endpoint)
        if version_match:
            version = int(version_match.group(1))
            # Check if higher version exists in all endpoints
            for other_ep in all_endpoints:
                other_match = re.search(r'/v(\d+)/', other_ep)
                if other_match:
                    other_version = int(other_match.group(1))
                    # Check if they share the same base path
                    base_current = re.sub(r'/v\d+/', '', endpoint)
                    base_other = re.sub(r'/v\d+/', '', other_ep)
                    if base_current == base_other and other_version > version:
                        return "Deprecated API"

        if not is_documented:
            # Simple heuristic for Zombie vs Shadow vs Orphaned
            if "internal" in endpoint or "test" in endpoint or "dev" in endpoint:
                return "Zombie API"
            elif "old" in endpoint or "legacy" in endpoint:
                return "Orphaned API"
            else:
                return "Shadow API"
        
        return "Active API"
