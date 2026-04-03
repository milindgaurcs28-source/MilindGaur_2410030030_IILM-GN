class Solution:
    def findUnion(self, a, b):
        return list(set(a).union(set(b)))

# Time Complexity: O(n + m)
# Space Complexity: O(n + m)
