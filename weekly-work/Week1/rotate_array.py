class Solution:
    def rotate(self, arr):
        return [arr[-1]] + arr[:-1]

# Time Complexity: O(n)
# Space Complexity: O(n)
