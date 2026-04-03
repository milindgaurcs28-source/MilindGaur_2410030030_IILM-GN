class Solution:
    def find_median(self, arr):
        arr.sort()
        n = len(arr)
        if n % 2 == 1:
            return arr[n // 2]
        else:
            return (arr[n // 2 - 1] + arr[n // 2]) / 2

# Time Complexity: O(n log n)
# Space Complexity: O(1)
