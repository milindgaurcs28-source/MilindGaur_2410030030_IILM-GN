class Solution:
    def factorial(self, n):
        result = 1
        for i in range(2, n + 1):
            result *= i
        return list(map(int, str(result)))

# Time Complexity: O(n)
# Space Complexity: O(n)
