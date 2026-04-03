class Solution:
    def isPalinArray(self, arr):
        for num in arr:
            if str(num) != str(num)[::-1]:
                return False
        return True

# Time Complexity: O(n * d)
# Space Complexity: O(1)
