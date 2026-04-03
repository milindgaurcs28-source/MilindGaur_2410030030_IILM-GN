class Solution:
    def kthSmallest(self, arr, k):
        arr.sort()
        return arr[k - 1]

# Time Complexity: O(n log n)
# Space Complexity: O(1)
