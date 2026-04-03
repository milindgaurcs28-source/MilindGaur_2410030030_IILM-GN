class Solution:
    def getMinMax(self, arr):
        min_val = max_val = arr[0]
        for num in arr:
            min_val = min(min_val, num)
            max_val = max(max_val, num)
        return [min_val, max_val]

# Time Complexity: O(n)
# Space Complexity: O(1)
