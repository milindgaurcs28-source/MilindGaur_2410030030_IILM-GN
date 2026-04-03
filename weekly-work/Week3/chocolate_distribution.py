class Solution:
    def findMinDiff(self, arr, m):
        if m == 0 or len(arr) < m:
            return 0
        
        arr.sort()
        min_diff = float('inf')
        
        for i in range(len(arr) - m + 1):
            min_diff = min(min_diff, arr[i + m - 1] - arr[i])
        
        return min_diff

# Time Complexity: O(n log n)
# Space Complexity: O(1)
